import pandas as pd
import json

def convert_csv_to_json(csv_file_path, json_file_path):
    # CSV 파일 읽기
    df = pd.read_csv(csv_file_path)

    # 'text' 열 추가하기
    df['text'] = ("Below is an instruction that describes a task. Write a response that appropriately completes the request. "
                  "### Instruction: " + df['instruction'] +
                  " ### Input: " + df['input'] +
                  " ### Response: " + df['output'])

    # DataFrame을 JSON 형식으로 변환
    json_data = df.to_dict(orient='records')

    # JSON 파일로 저장
    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(json_data, json_file, ensure_ascii=False, indent=4)

    print(f"Data has been saved to {json_file_path}")

# 사용 예시
# convert_csv_to_json('path_to_input.csv', 'path_to_output.json')
