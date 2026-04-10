import os
import boto3
from fastapi import UploadFile
from botocore.config import Config

def get_spaces_client():
    return boto3.client(
        's3',
        region_name=os.getenv('DO_SPACES_REGION', 'nyc3'),
        endpoint_url=os.getenv('DO_SPACES_ENDPOINT', 'https://dsphotography.nyc3.digitaloceanspaces.com'),
        aws_access_key_id=os.getenv('DO_SPACES_KEY'),
        aws_secret_access_key=os.getenv('DO_SPACES_SECRET'),
        config=Config(s3={'addressing_style': 'virtual'})
    )

async def upload_to_spaces(file: UploadFile, folder: str = 'images') -> str:
    try:
        client = get_spaces_client()
        bucket = os.getenv('DO_SPACES_BUCKET', 'dsphotography')
        
        file_key = f"{folder}/{file.filename}"
        
        file_content = await file.read()
        
        client.put_object(
            Bucket=bucket,
            Key=file_key,
            Body=file_content,
            ACL='public-read',
            ContentType=file.content_type or 'application/octet-stream'
        )
        
        url = f"{os.getenv('DO_SPACES_ENDPOINT', 'https://dsphotography.nyc3.digitaloceanspaces.com')}/{bucket}/{file_key}"
        return url
    except Exception as e:
        print(f"Error uploading to Spaces: {e}")
        raise
