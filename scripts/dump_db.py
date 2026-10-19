import os
import subprocess
import sys

def main():
    raw_url = os.environ.get('DATABASE_URL', '').strip()
    if not raw_url:
        print("ERROR: DATABASE_URL environment variable is missing.")
        sys.exit(1)

    clean = raw_url
    if clean.startswith('jdbc:'):
        clean = clean[5:]
    if clean.startswith('postgresql://'):
        clean = clean[13:]
    elif clean.startswith('postgres://'):
        clean = clean[11:]

    # Remove query string
    q_idx = clean.find('?')
    if q_idx != -1:
        clean = clean[:q_idx]

    # Split credentials using rfind to correctly handle '@' inside passwords
    at_idx = clean.rfind('@')
    user, password = '', ''
    if at_idx != -1:
        user_info = clean[:at_idx]
        clean = clean[at_idx + 1:]
        colon_idx = user_info.find(':')
        if colon_idx != -1:
            user = user_info[:colon_idx]
            password = user_info[colon_idx + 1:]
        else:
            user = user_info

    # Extract db name
    slash_idx = clean.find('/')
    dbname = 'postgres'
    if slash_idx != -1:
        dbname = clean[slash_idx + 1:]
        clean = clean[:slash_idx]

    # Extract host and port
    colon_idx = clean.find(':')
    host = clean
    port = '5432'
    if colon_idx != -1:
        host = clean[:colon_idx]
        port = clean[colon_idx + 1:]

    env = os.environ.copy()
    env['PGHOST'] = host
    env['PGPORT'] = port
    env['PGUSER'] = user
    env['PGPASSWORD'] = password
    env['PGDATABASE'] = dbname

    output_file = sys.argv[1] if len(sys.argv) > 1 else 'streakforge_backup.sql'
    print(f"Connecting to host '{host}:{port}', db '{dbname}' as user '{user}'...")

    with open(output_file, 'w') as f:
        result = subprocess.run(['pg_dump'], env=env, stdout=f, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        print(f"ERROR: pg_dump failed with returncode {result.returncode}:")
        print(result.stderr)
        sys.exit(1)

    file_size = os.path.getsize(output_file)
    print(f"pg_dump completed successfully. Saved {file_size} bytes to {output_file}.")

if __name__ == '__main__':
    main()
