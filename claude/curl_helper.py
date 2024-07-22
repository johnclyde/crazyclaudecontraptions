import os
from dotenv import load_dotenv
import pycurl
from io import BytesIO

# Load environment variables from the .env file
load_dotenv()

# Assign environment variables to local variables
domain = os.getenv('DOMAIN')
organization = os.getenv('ORGANIZATION')
project = os.getenv('PROJECT')
session_key = os.getenv('SESSION_KEY')
activity_session_id = os.getenv('ACTIVITY_SESSION_ID')
fbp = os.getenv('FBP')
ssid = os.getenv('SSID')
rdt_uuid = os.getenv('RDT_UUID')
stripe_mid = os.getenv('STRIPE_MID')
cf_clearance = os.getenv('CF_CLEARANCE')
cf_bm = os.getenv('CF_BM')
intercom_session = os.getenv('INTERCOM_SESSION')
sentry_trace = os.getenv('SENTRY_TRACE')

# Construct the URL
url = f'{domain}/api/organizations/{organization}/projects/{project}/docs'

# Construct the cookies
cookies = [
    f'_fbp={fbp}',
    f'__ssid={ssid}',
    'CH-prefers-color-scheme=light',
    'user-sidebar-pinned=false',
    f'_rdt_uuid={rdt_uuid}',
    f'__stripe_mid={stripe_mid}',
    f'sessionKey={session_key}',
    f'lastActiveOrg={organization}',
    f'activitySessionId={activity_session_id}',
    f'__cf_bm={cf_bm}',
    f'cf_clearance={cf_clearance}',
    f'intercom-session-lupk8zyo={intercom_session}',
]

headers = [
    f'cookie: {"; ".join(cookies)}',
    'priority: u=1, i',
    f'referer: {domain}/project/{project}',
    'sec-fetch-dest: empty',
    'sec-fetch-mode: cors',
    'sec-fetch-site: same-origin',
    f'sentry-trace: {sentry_trace}',
    'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
]

# Create a BytesIO object to capture the response
response_buffer = BytesIO()
curl = pycurl.Curl()
curl.setopt(curl.URL, url)
curl.setopt(curl.HTTPHEADER, headers)
curl.setopt(curl.WRITEDATA, response_buffer)
curl.perform()
curl.close()
response_content = response_buffer.getvalue().decode('utf-8')
print(response_content)
