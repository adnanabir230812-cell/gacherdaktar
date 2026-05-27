async function testChat() {
  const payload = {
    query: "ধানের পাতা হলুদ হয়ে যাচ্ছে, করণীয় কী?",
    district: "ঢাকা",
    season: "বোরো"
  };

  console.log("Sending request to http://localhost:3001/api/chat with payload:", payload);

  try {
    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error during fetch:", err);
  }
}

testChat();
