import csv
import json
import sys
from transformer import transform_json_with_jsonata, JSONATA_EXPRESSION

def transform_csv_lines(lines):
    reader = csv.reader(lines)
    header = next(reader, None)
    message_index = 1
    if header and 'message' in [h.lower() for h in header]:
        message_index = [h.lower() for h in header].index('message')
    else:
        # include header back as data row if not recognized
        if header:
            lines = [','.join(header)] + list(lines)
            reader = csv.reader(lines)
    results = []
    for row in reader:
        if len(row) <= message_index:
            continue
        json_part = row[message_index].strip()
        if json_part.startswith('"') and json_part.endswith('"'):
            json_part = json_part[1:-1]
        json_part = json_part.replace('""', '"')
        try:
            data = json.loads(json_part)
        except json.JSONDecodeError as e:
            results.append({'error': str(e), 'row': row})
            continue
        transformed = transform_json_with_jsonata(data)
        results.append(transformed)
    return results

def main():
    input_text = sys.stdin.read()
    lines = [line for line in input_text.splitlines() if line.strip()]
    results = transform_csv_lines(lines)
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
