import boto3
import csv
import json
import os
import tempfile

# Clients
s3 = boto3.client('s3')
ssm = boto3.client('ssm')
sqs = boto3.client('sqs')

def csv_to_json(csv_path, data_type='students'):
    # Initialize an empty list for the final data
    data = []

    with open(csv_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            # Handle the logic based on the data type
            if data_type == 'students':
                if 'subjects' in row and row['subjects']:
                    row['subjects'] = row['subjects'].split('|')
                data.append({
                    'name': row.get('name'),
                    'subjects': row['subjects'],
                    'grade': row.get('grade'),
                    'age': row.get('age'),
                })
            elif data_type == 'teachers':
                # Teacher-specific logic
                if 'teaching_subjects' in row and row['teaching_subjects']:
                    row['teaching_subjects'] = row['teaching_subjects'].split('|')
                data.append({
                    'name': row.get('name'),
                    'teaching_subjects': row['teaching_subjects'],
                    'lectureLoad': row.get('lectureLoad')
                })
            elif data_type == 'classrooms':
                data.append({
                    'roomNumber': row.get('room_number'),
                    'capacity': row.get('capacity'),
                    'isLab': row.get('isLab')
                })

    return data

def lambda_handler(event, context):
    try:
        # === 1. Fetch SQS URL from SSM Parameter Store ===
        ssm_response = ssm.get_parameter(
            Name='/course-backend/SQS_QUEUE_URL',  
            WithDecryption=True
        )
        sqs_url = ssm_response['Parameter']['Value']

        # === 2. Process the incoming S3 Event ===
        record = event['Records'][0]
        bucket_name = record['s3']['bucket']['name']
        csv_key = record['s3']['object']['key']

        # Only handle .csv files
        if not csv_key.endswith('.csv'):
            print(f"Skipping non-CSV file: {csv_key}")
            return

        # Temporary file paths
        tmp_csv = os.path.join(tempfile.gettempdir(), 'input.csv')
        tmp_json = os.path.join(tempfile.gettempdir(), 'output.json')

        # Download CSV file from S3
        s3.download_file(bucket_name, csv_key, tmp_csv)
        print(f"Downloaded: {csv_key} from bucket: {bucket_name}")

        # Determine the type of data from the file name or metadata
        if 'teachers' in csv_key.lower():
            data_type = 'teachers'
        elif 'classrooms' in csv_key.lower():
            data_type = 'classrooms'
        elif 'students' in csv_key.lower():
            data_type = 'students'

        # Convert CSV to JSON based on the determined type
        data_json = csv_to_json(tmp_csv, data_type)

        # Write JSON to a temporary file
        with open(tmp_json, 'w', encoding='utf-8') as f:
            json.dump(data_json, f, indent=2)

        # Define output key for the JSON file
        json_key = csv_key.replace('uploads/', 'converted/').replace('.csv', '.json')

        # Upload JSON to S3
        s3.upload_file(tmp_json, bucket_name, json_key)
        print(f"Uploaded JSON to: {json_key}")

        # === 3. Send message to SQS after JSON is ready ===
        sqs_response = sqs.send_message(
            QueueUrl=sqs_url,
            MessageBody=json.dumps({
                'bucket': bucket_name,
                'key': json_key,
                'data_type': data_type
            })
        )
        print(f"Sent message to SQS: {sqs_response.get('MessageId')}")

        return {
            'statusCode': 200,
            'body': f'CSV converted to JSON and uploaded to {json_key}, SQS notified.'
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': 'Error processing file.'
        }
