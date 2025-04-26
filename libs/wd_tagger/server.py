import json
import sys
import numpy as np
import onnxruntime as rt
import pandas as pd
from PIL import Image
from wd_predictor import predict_tags

def main():
    while True:
        # Чтение запроса из stdin
        line = sys.stdin.readline().strip()
        if not line:
            break

        # Парсинг запроса
        request = json.loads(line)
        action = request.get('action')
        params = request.get('params')

        result = None

        try:
            if action == 'ping':
                result = {
                    "answer": 'pong'
                }

            if action == 'wd_predict_tags':
                # Загрузка изображения
                image_path = params.get('filepath')
                image = Image.open(image_path)

                # Параметры для распознавания
                general_threshold = params.get('general_threshold', 0.3)
                character_threshold = params.get('character_threshold', 0.8)
                input_tags = params.get('input_tags', "")
                input_series = params.get('input_series', "")
                input_character = params.get('input_character', "")

                # Выполнение распознавания
                output_series_tag, output_character_tag, output_prompt = predict_tags(
                    image, general_threshold, character_threshold, input_tags, input_series, input_character
                )
            # Формирование результата в формате JSON
            result = {
                "series_tag": output_series_tag,
                "character_tag": output_character_tag,
                "prompt": output_prompt
            }
        except: 
            result = {
                "message": "Something wrong!",
                "error": True
            }

        # Вывод результата в stdout
        if result != None:
            print(json.dumps(result), flush=True)

if __name__ == "__main__":
    main()
