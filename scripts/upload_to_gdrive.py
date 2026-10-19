import os
import sys
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    creds_json = os.environ.get('GDRIVE_SERVICE_ACCOUNT_KEY')
    folder_id = os.environ.get('GDRIVE_FOLDER_ID')
    backup_file = sys.argv[1] if len(sys.argv) > 1 else 'streakforge_backup.sql'

    if not creds_json:
        print("ERROR: GDRIVE_SERVICE_ACCOUNT_KEY environment variable is missing.")
        sys.exit(1)

    if not folder_id:
        print("ERROR: GDRIVE_FOLDER_ID environment variable is missing.")
        sys.exit(1)

    if not os.path.exists(backup_file):
        print(f"ERROR: Backup file {backup_file} does not exist.")
        sys.exit(1)

    # Parse credentials
    try:
        service_account_info = json.loads(creds_json)
    except Exception as e:
        print(f"ERROR: Failed to parse GDRIVE_SERVICE_ACCOUNT_KEY as JSON: {e}")
        sys.exit(1)

    creds = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=SCOPES
    )
    drive_service = build('drive', 'v3', credentials=creds)

    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    timestamped_name = f"streakforge_backup_{today_str}.sql"
    latest_name = "streakforge_latest.sql"

    media = MediaFileUpload(backup_file, mimetype='application/sql', resumable=True)

    print(f"Uploading {backup_file} to Google Drive folder '{folder_id}'...")

    # 1. Upload timestamped backup
    file_metadata = {
        'name': timestamped_name,
        'parents': [folder_id]
    }
    created_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, name, size'
    ).execute()
    print(f"Successfully uploaded: {created_file.get('name')} (ID: {created_file.get('id')})")

    # 2. Upload or update 'streakforge_latest.sql'
    query = f"'{folder_id}' in parents and name = '{latest_name}' and trashed = false"
    results = drive_service.files().list(q=query, fields='files(id, name)').execute()
    existing_files = results.get('files', [])

    if existing_files:
        existing_id = existing_files[0]['id']
        drive_service.files().update(
            fileId=existing_id,
            media_body=media
        ).execute()
        print(f"Successfully updated latest pointer: {latest_name} (ID: {existing_id})")
    else:
        latest_metadata = {
            'name': latest_name,
            'parents': [folder_id]
        }
        latest_created = drive_service.files().create(
            body=latest_metadata,
            media_body=media,
            fields='id, name'
        ).execute()
        print(f"Successfully created: {latest_created.get('name')} (ID: {latest_created.get('id')})")

    print("Google Drive backup completed successfully!")

if __name__ == '__main__':
    main()
