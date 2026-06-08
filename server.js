const express = require("express");
const cors = require("cors");
const dns = require("dns").promises;
const { chromium } = require("playwright");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/dns-test", async (req, res) => {
  try {
    const result = await dns.lookup("wms.thegioididong.com");

    res.json(result);
  } catch (e) {
    res.json({
      error: e.message,
    });
  }
});

app.get("/network-test", async (req, res) => {
  try {
    const response = await fetch("https://wms.thegioididong.com", {
      signal: AbortSignal.timeout(10000),
    });

    res.json({
      success: true,
      status: response.status,
    });
  } catch (e) {
    res.json({
      success: false,
      name: e.name,
      message: e.message,
      cause: {
        code: e.cause?.code,
        errno: e.cause?.errno,
        syscall: e.cause?.syscall,
        address: e.cause?.address,
        port: e.cause?.port,
      },
    });
  }
});

app.post("/update-status-tradein-jobcard", async (req, res) => {
  try {
    const { user, identity, jobcard } = req.body;

    console.log("Launching browser...");
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const initInfo = {
      user: user,
      password: identity,
      jobcard: jobcard,
    };

    const page = await browser.newPage();

    await page.goto("https://wms.thegioididong.com", {
      timeout: 60000, // 60 giây
    });

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

    console.log("[1] Đăng nhập");
    await page.click("#kc-login");

    await page.click("#loginStore");

    console.log("[2] Tìm theo mã Jobcard");
    await page.fill("#txtKeySearch", initInfo.jobcard);

    await page.click("#btnSearch");

    console.log("[3] Chọn Jobcard chỉ định");
    await page.getByRole("link", { name: initInfo.jobcard }).click();

    console.log("[4] Click 'Cập nhập tình trạng lỗi'");
    await page.getByRole("link", { name: "Cập nhập tình trạng lỗi" }).click();

    // Error type
    await page.click("#select2-slSymptomRepair-container");

    console.log("[5] Chọn loại lỗi");
    await page.fill(".select2-search__field", "Thu cũ - đổi mới");

    await page.getByRole("treeitem", { name: "Thu cũ - đổi mới" }).click();

    // Note
    console.log("[6] Nhập ghi chú");
    await page.fill("#noteSymptomPBKT", "TCDM");

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

app.listen(process.env.PORT || 10000, () => {
  console.log(" 🚀 Server running on port " + (process.env.PORT || 10000));
});
