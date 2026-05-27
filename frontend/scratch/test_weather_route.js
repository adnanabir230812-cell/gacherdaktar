async function testWeather() {
  const url = "http://localhost:3001/api/weather?district=ঢাকা";
  console.log("Fetching weather endpoint:", url);

  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Keys:", Object.keys(data));
    console.log("Current Temperature:", data.temp);
    console.log("Weather Condition:", data.condition);
    console.log("Rain Advice:", JSON.stringify(data.advice.rain, null, 2));
    console.log("Disease Risk Advice:", JSON.stringify(data.advice.disease_risk, null, 2));
  } catch (err) {
    console.error("Error during fetch:", err);
  }
}

testWeather();
