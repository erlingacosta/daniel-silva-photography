import boto3
from fastapi import UploadFile
from botocore.config import Config
from config import settings

def get_spaces_client():
    return boto3.client(
        's3',
        region_name=settings.DO_SPACES_REGION,
        endpoint_url=settings.DO_SPACES_ENDPOINT,
        aws_access_key_id=settings.DO_SPACES_KEY,
        aws_secret_access_key=settings.DO_SPACES_SECRET,
        config=Config(s3={'addressing_style': 'virtual'})
    )

async def upload_to_spaces(file: UploadFile, folder: str = 'images') -> str:
    try:
        client = get_spaces_client()
        bucket = settings.DO_SPACES_BUCKET
        
        file_key = f"{folder}/{file.filename}"
        
        file_content = await file.read()
        
        client.put_object(
            Bucket=bucket,
            Key=file_key,
            Body=file_content,
            ACL='public-read',
            ContentType=file.content_type or 'application/octet-stream'
        )
        
        url = f"{settings.DO_SPACES_ENDPOINT}/{bucket}/{file_key}"
        return url
    except Exception as e:
        print(f"Error uploading to Spaces: {e}")
        raise
