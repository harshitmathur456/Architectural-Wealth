const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAZPxNylyfz5le8g3byk_cUe_bpzo6AIfo';

async function testGrounding() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: "What is the exact current exchange rate of 1 United States Dollar to Indian Rupee today? Just give the number." }] }],
    tools: [{ googleSearch: {} }]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testGrounding();
