const express = require("express");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/data", async (req, res) => {
  try {
    // 1. Random User API
    const userRes = await axios.get("https://randomuser.me/api/");
    const user = userRes.data.results[0];

    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      age: user.dob.age,
      dob: user.dob.date.split("T")[0],
      city: user.location.city,
      country: user.location.country,
      address: `${user.location.street.name}, ${user.location.street.number}`,
      photo: user.picture.large
    };

    // 2. REST Countries API
    const countryRes = await axios.get(
      `https://restcountries.com/v3.1/name/${userData.country}`
    );
    const country = countryRes.data[0];

    const countryData = {
      name: country.name.common,
      capital: country.capital ? country.capital[0] : "N/A",
      languages: country.languages
        ? Object.values(country.languages).join(", ")
        : "N/A",
      currencyCode: country.currencies
        ? Object.keys(country.currencies)[0]
        : "N/A",
      flag: country.flags.png
    };

    // 3. Exchange Rate API
    let ratesData = {};
    if (countryData.currencyCode !== "N/A") {
      const rateRes = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/${countryData.currencyCode}`
      );

      ratesData = {
        base: countryData.currencyCode,
        usd: rateRes.data.conversion_rates.USD,
        kzt: rateRes.data.conversion_rates.KZT
      };
    }

    // 4. News API
    const newsRes = await axios.get(
      `https://newsapi.org/v2/everything?q=${userData.country}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );

    const news = newsRes.data.articles.map(a => ({
      title: a.title,
      description: a.description,
      image: a.urlToImage,
      url: a.url
    }));

    res.json({
      user: userData,
      country: countryData,
      rates: ratesData,
      news: news
    });
  } catch (err) {
    console.error("API ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch API data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});