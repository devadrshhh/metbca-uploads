async function testFetch() {
  const url = 'https://res.cloudinary.com/dnh91ctgw/image/upload/v1783233043/user_uploads/S_w_engee_ass.pdf';
  
  console.log('Testing fetch without User-Agent...');
  try {
    const res = await fetch(url);
    console.log('Status without UA:', res.status, res.statusText);
  } catch (err: any) {
    console.error('Error without UA:', err.message);
  }

  console.log('\nTesting fetch with User-Agent...');
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Status with UA:', res.status, res.statusText);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      console.log('Successfully fetched buffer! Size:', buffer.byteLength, 'bytes');
    }
  } catch (err: any) {
    console.error('Error with UA:', err.message);
  }
}

testFetch();
