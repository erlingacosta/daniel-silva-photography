import boto3
from fastapi import UploadFile, HTTPException
from botocore.config import Config
from botocore.exceptions import ClientError
from config import settings
import traceback

def get_spaces_client():
    """Initialize Spaces S3 client with error checking"""
    try:
        if not settings.DO_SPACES_KEY or not settings.DO_SPACES_SECRET:
            raise ValueError("DO_SPACES_KEY or DO_SPACES_SECRET not configured in environment")
        
        print(f"🔌 Initializing Spaces client...")
        print(f"   Key: {settings.DO_SPACES_KEY[:10]}...")
        print(f"   Region: {settings.DO_SPACES_REGION}")
        print(f"   Bucket: {settings.DO_SPACES_BUCKET}")
        print(f"   Endpoint: https://{settings.DO_SPACES_REGION}.digitaloceanspaces.com")
        
        # IMPORTANT: endpoint_url should NOT include bucket name
        # boto3 will prepend bucket name automatically
        endpoint_url = f"https://{settings.DO_SPACES_REGION}.digitaloceanspaces.com"
        
        client = boto3.client(
            's3',
            region_name=settings.DO_SPACES_REGION,
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.DO_SPACES_KEY,
            aws_secret_access_key=settings.DO_SPACES_SECRET,
            config=Config(s3={'addressing_style': 'virtual'})
        )
        
        # Test connection
        client.head_bucket(Bucket=settings.DO_SPACES_BUCKET)
        print(f"✅ Spaces client initialized and bucket accessible")
        return client
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        print(f"❌ Spaces API error: {error_code} - {error_msg}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Spaces error ({error_code}): {error_msg}")
    except Exception as e:
        print(f"❌ Failed to initialize Spaces client: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Spaces configuration error: {str(e)}")

async def upload_to_spaces(file: UploadFile, folder: str = 'images') -> str:
    """Upload file to DigitalOcean Spaces"""
    try:
        print(f"📤 Starting upload: {file.filename}")
        
        if not settings.DO_SPACES_KEY:
            raise ValueError("DO_SPACES_KEY is not set in environment")
        if not settings.DO_SPACES_SECRET:
            raise ValueError("DO_SPACES_SECRET is not set in environment")
        
        client = get_spaces_client()
        bucket = settings.DO_SPACES_BUCKET
        region = settings.DO_SPACES_REGION
        
        print(f"📁 Using bucket: {bucket}")
        
        file_key = f"{folder}/{file.filename}"
        print(f"🔑 File key: {file_key}")
        
        file_content = await file.read()
        print(f"📊 File size: {len(file_content)} bytes")
        
        # Upload to Spaces
        print(f"⬆️  Uploading to Spaces...")
        client.put_object(
            Bucket=bucket,
            Key=file_key,
            Body=file_content,
            ACL='public-read',
            ContentType=file.content_type or 'application/octet-stream'
        )
        
        # Construct public URL correctly (bucket.region.digitaloceanspaces.com)
        url = f"https://{bucket}.{region}.digitaloceanspaces.com/{file_key}"
        print(f"✅ Upload successful: {url}")
        return url
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        print(f"❌ Spaces API error during upload: {error_code} - {error_msg}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Spaces upload error ({error_code}): {error_msg}")
    except ValueError as e:
        print(f"❌ Configuration error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        print(f"❌ Upload failed: {type(e).__name__}: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
