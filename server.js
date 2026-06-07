const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/update-status-tradein-jobcard", async (req, res) => {
  try {
    const { user, identity, jobcard } = req.body;

    const browser = await chromium.launch({
      headless: false,
    });

    const initInfo = {
      user: user,
      password: identity,
      jobcard: jobcard,
    };

    const page = await browser.newPage();

    await page.goto("https://wms.thegioididong.com");

    console.log("☄️ Website opened");

    await page.click("#btn-login-sso");

    await page.fill("#username", initInfo.user);

    await page.click("#kc-login");

    await page.fill("#otp-1", initInfo.password[0]);
    await page.fill("#otp-2", initInfo.password[1]);
    await page.fill("#otp-3", initInfo.password[2]);
    await page.fill("#otp-4", initInfo.password[3]);
    await page.fill("#otp-5", initInfo.password[4]);
    await page.fill("#otp-6", initInfo.password[5]);

    console.log("[1] LOGIN");
    await page.click("#kc-login");

    await page.click("#loginStore");

    console.log("[2] SEARCH JOBCARD");
    await page.fill("#txtKeySearch", initInfo.jobcard);

    await page.click("#btnSearch");

    await page.click(".component-a");

    console.log("Website flow finished 🎬");

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(" 🚀 Server running on port " + (process.env.PORT || 3000));
});
