import exifr from 'exifr';
import fs from 'fs';
import path from 'path';
import extractChunks from 'png-chunks-extract';
import { decode as decodeTextChunk } from 'png-chunk-text';

/**
 * @typedef {object} AIMetadata
 * @property {string|null} model
 * @property {string[]|null} loras
 * @property {string|null} prompt
 * @property {string|null} negativePrompt
 * @property {Number|null} steps
 * @property {string|null} sampler
 * @property {Number|null} cfgScale
 * @property {Number|null} seed
 */

/**
 * Основная функция извлечения метаданных из файла (JPEG, PNG, WebP)
 * @param {*} filePath
 * @returns {Promise<AIMetadata>}
 */
export async function extractAIMetadata(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // Добавляем задержку для избежания EBUSY
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.webp') {
      // Используем exifr для чтения EXIF
      const exifData = await exifr.parse(filePath, {
        userComment: true,
        imageDescription: true
      });
      const rawMetadata =
        exifData?.userComment || exifData?.imageDescription || '';
      const cleaned = Buffer.from(rawMetadata)
        .toString('utf8')
        .replace(/^\uFEFF?UNICODE/, '')
        .replace(/\n/g, '')
        .replace(/\0/g, '');
      return extractMetadata(cleaned);
    } else if (ext === '.png') {
      // Читаем текстовые чанки PNG
      const rawMetadata = getPngTextChunks(filePath);
      return extractMetadata(rawMetadata);
    } else {
      throw new Error('Unsupported file format: ' + ext);
    }
  } catch (e) {
    console.error('Error extracting metadata:', e);
    return getDefaultAIMetadata();
  }
}

/**
 * Default result for exceptions
 * @returns {AIMetadata}
 */
function getDefaultAIMetadata() {
  return {
    loras: [],
    prompt: '',
    negativePrompt: '',
    steps: null,
    sampler: '',
    cfgScale: null,
    seed: null,
    model: ''
  };
}

/**
 * Универсальная функция парсинга метаданных из строки или объекта.
 * @param {any} rawMetadata
 * @returns {AIMetadata}
 */
function extractMetadata(rawMetadata) {
  if (!rawMetadata) {
    return getDefaultAIMetadata();
  }

  const comfyData = extractComfyData(rawMetadata);
  if (comfyData && comfyData?.nodes?.length > 0) {
    return parseComfyMetadata(comfyData);
  }
  if (comfyData && comfyData.extraMetadata) {
    return parseCivitMetadata(comfyData.extraMetadata);
  }

  const webUIData = extractWebUIData(rawMetadata);
  if (webUIData) {
    return parseWebUIMetadata(webUIData);
  }

  // Парсим Auto1111 / WebUI текстовый формат
  if (typeof rawMetadata === 'string') {
    const promptMatch = rawMetadata.match(/^(?:prompt|Prompt):\s*(.+)$/im);
    const negativeMatch = rawMetadata.match(/Negative prompt:\s*(.+)$/im);
    const stepsMatch = rawMetadata.match(/Steps:\s*(\d+)/i);
    const samplerMatch = rawMetadata.match(/Sampler:\s*([\w_-]+)/i);
    const cfgMatch = rawMetadata.match(/CFG scale:\s*([\d.]+)/i);
    const seedMatch = rawMetadata.match(/Seed:\s*(\d+)/i);
    const modelMatch = rawMetadata.match(/Model(?: hash)?:\s*(.+)$/im);

    return {
      prompt: promptMatch ? promptMatch[1].trim() : '',
      negativePrompt: negativeMatch ? negativeMatch[1].trim() : '',
      steps: stepsMatch ? Number(stepsMatch[1]) : null,
      sampler: samplerMatch ? samplerMatch[1] : '',
      cfgScale: cfgMatch ? Number(cfgMatch[1]) : null,
      seed: seedMatch ? Number(seedMatch[1]) : null,
      model: modelMatch ? modelMatch[1].trim() : ''
    };
  }

  // Парсим SwarmUI JSON с sui_image_params
  try {
    const json =
      typeof rawMetadata === 'string' ? JSON.parse(rawMetadata) : rawMetadata;
    if (json?.sui_image_params) {
      return {
        prompt: json.sui_image_params.prompt || '',
        negativePrompt: json.sui_image_params.negative_prompt || '',
        steps: json.sui_image_params.steps || null,
        sampler: json.sui_image_params.sampler || '',
        cfgScale: json.sui_image_params.cfg_scale || null,
        seed: json.sui_image_params.seed || null,
        model: json.sui_models?.[0]?.name || ''
      };
    }
  } catch {
    // игнорируем ошибки парсинга
  }

  // Если ничего не подошло — возвращаем пустой объект
  return getDefaultAIMetadata();
}

/**
 * Извлечение текстовых чанков из PNG
 * @param {string} filepath
 * @returns {[{keyword: string, text: string}]}
 */
function getPngTextChunks(filePath) {
  const buffer = fs.readFileSync(filePath);
  const chunks = extractChunks(buffer);
  const textChunks = chunks
    .filter((c) => c.name === 'tEXt' || c.name === 'iTXt')
    .map((c) => {
      const decoded = decodeTextChunk(c.data);
      return {
        keyword: decoded.keyword,
        text: decoded.text
      };
    });

  return textChunks;
}

function extractComfyData(rawMetadata) {
  let comfyData = null;
  try {
    // Поиск workflow JSON
    if (typeof rawMetadata === 'object' && rawMetadata !== null) {
      rawMetadata.forEach((item) => {
        if (item.keyword === 'workflow') {
          try {
            comfyData = JSON.parse(item.text);
          } catch (e) {
            console.warn('Не удалось распарсить JSON workflow', e);
          }
        }
      });
    } else if (typeof rawMetadata === 'string') {
      try {
        comfyData = JSON.parse(rawMetadata);
      } catch (e) {
        console.warn('Не удалось распарсить JSON', e);
      }
    }
  } catch (e) {
    console.warn('Ошибка при попытке распарсить JSON', e);
    comfyData = null;
  }

  return comfyData;
}

/**
 * Parse data response from CivitAI
 * @param {string} extraMetadata
 * @returns {AIMetadata}
 */
function parseCivitMetadata(extraMetadata) {
  try {
    const jsonData = JSON.parse(extraMetadata);
    return {
      loras: [],
      prompt: jsonData.prompt,
      negativePrompt: jsonData.negativePrompt,
      steps: jsonData.steps,
      sampler: jsonData.sampler,
      cfgScale: jsonData.cfgScale,
      seed: null,
      model: ''
    };
  } catch {
    return getDefaultAIMetadata();
  }
}

/**
 * Парсим то что пришло из ComfyUI
 * @param {any} comfyData
 * @returns {AIMetadata}
 */
function parseComfyMetadata(comfyData) {
  const metaNode = comfyData.nodes.find((n) => n.type === 'KSampler');

  if (!Array.isArray(comfyData?.nodes) || comfyData?.nodes?.length <= 0) {
    return getDefaultAIMetadata();
  }

  let prompt = comfyData.nodes.find(
    (n) =>
      n.title === 'Show resulting prompt' && Array.isArray(n.widgets_values)
  )?.widgets_values[0]?.[0];

  if (!prompt) {
    const posLinkId = metaNode.inputs.find((n) => n.name == 'positive')?.link;
    const posNodeId = comfyData.links.find((n) => n[0] == posLinkId)?.[1];
    prompt = comfyData.nodes.find((n) => n.id == posNodeId).widgets_values[0];
  }
  if (!prompt) {
    const firstNode = comfyData.nodes[0];
    prompt = firstNode.text2 || firstNode.prompt || '';
  }

  const negLinkId = metaNode.inputs.find((n) => n.name == 'negative')?.link;
  const negNodeId = comfyData.links.find((n) => n[0] == negLinkId)?.[1];
  let negativePrompt = comfyData.nodes.find((n) => n.id == negNodeId)
    .widgets_values[0];
  negativePrompt =
    negativePrompt ||
    comfyData.negative_prompt ||
    comfyData.negativePrompt ||
    '';

  const steps =
    metaNode?.inputs?.steps ||
    metaNode?.widgets_values[2] ||
    comfyData.steps ||
    null;
  const sampler =
    metaNode?.inputs?.sampler_name ||
    metaNode?.widgets_values[4] ||
    comfyData.sampler ||
    null;
  const cfgScale =
    metaNode?.inputs?.cfg ||
    metaNode?.widgets_values[3] ||
    comfyData.cfgScale ||
    null;
  const seed =
    metaNode?.inputs?.seed ||
    metaNode?.widgets_values[0] ||
    comfyData.seed ||
    null;

  const model =
    comfyData.nodes.find((n) => n.type == 'CheckpointLoaderSimple')
      ?.widgets_values?.[0] ||
    comfyData.model ||
    '';

  const loras =
    comfyData.nodes
      .find((n) => n.type == 'Power Lora Loader (rgthree)')
      ?.widgets_values?.filter((v) => v?.on == true)
      .map((v) => v.lora) || [];

  return {
    loras: loras,
    prompt: prompt || '',
    negativePrompt: negativePrompt || '',
    steps: steps !== undefined ? Number(steps) : null,
    sampler: sampler || '',
    cfgScale: cfgScale !== undefined ? Number(cfgScale) : null,
    seed: seed !== undefined ? Number(seed) : null,
    model
  };
}

function extractWebUIData(rawMetadata) {
  let webUIData = null;
  try {
    // Поиск workflow JSON
    if (typeof rawMetadata === 'object' && rawMetadata !== null) {
      rawMetadata.forEach((item) => {
        if (item.keyword === 'parameters') {
          webUIData = item.text;
        }
      });
    }
  } catch (e) {
    console.warn('Ошибка при попытке распарсить JSON', e);
    webUIData = null;
  }

  return webUIData;
}

/**
 * Парсим метадату WebUI.
 * @param {any} webUIData
 * @returns {AIMetadata}
 */
function parseWebUIMetadata(webUIData) {
  // 1) Выделяем prompt — всё до "Negative prompt"
  const negativePromptIndex = webUIData.indexOf('Negative prompt:');
  const promptRaw =
    negativePromptIndex !== -1
      ? webUIData.slice(0, negativePromptIndex).trim()
      : webUIData.trim();

  // 2) Выделяем negativePrompt — между "Negative prompt:" и "Steps:"
  let negativePrompt = '';
  if (negativePromptIndex !== -1) {
    const stepsIndex = webUIData.indexOf('Steps:', negativePromptIndex);
    if (stepsIndex !== -1) {
      negativePrompt = webUIData
        .slice(negativePromptIndex + 'Negative prompt:'.length, stepsIndex)
        .trim();
    } else {
      negativePrompt = webUIData
        .slice(negativePromptIndex + 'Negative prompt:'.length)
        .trim();
    }
  }

  // 3) Выделяем остальные параметры с помощью регулярных выражений
  const stepsMatch = webUIData.match(/Steps:\s*(\d+)/i);
  const samplerMatch = webUIData.match(/Sampler:\s*([\w\s_-]+)/i);
  const cfgScaleMatch = webUIData.match(/CFG scale:\s*([\d.]+)/i);
  const seedMatch = webUIData.match(/Seed:\s*(\d+)/i);
  const modelMatch = webUIData.match(/Model:\s*([\w\\._-]+)/i);

  const steps = stepsMatch ? Number(stepsMatch[1]) : null;
  const sampler = samplerMatch ? samplerMatch[1].trim() : '';
  const cfgScale = cfgScaleMatch ? Number(cfgScaleMatch[1]) : null;
  const seed = seedMatch ? Number(seedMatch[1]) : null;
  const model = modelMatch ? modelMatch[1].trim() : '';

  // 4) Извлекаем лоры из prompt и удаляем их из prompt
  const loraRegex = /<lora:([\w_]+):([\d.]+)>/gi;
  const loras = [];
  let prompt = promptRaw
    .replace(loraRegex, (match, name) => {
      loras.push(name);
      return ''; // удаляем лору из prompt
    })
    .replace(/\s+/g, ' ')
    .trim();

  return {
    loras,
    prompt,
    negativePrompt,
    steps,
    sampler,
    cfgScale,
    seed,
    model
  };
}
