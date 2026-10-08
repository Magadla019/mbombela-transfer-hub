import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True);c=await b.new_context(viewport={"width":1280,"height":1800});pg=await c.new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto("http://localhost:8080/login");await pg.wait_for_timeout(2500)
    await pg.get_by_role("button",name="Partner",exact=False).first.click();await pg.wait_for_timeout(500)
    i=pg.locator("input:visible").first;await i.fill("Mbombela Transfer 452");await i.press("Enter");await pg.wait_for_timeout(5000)
    await pg.get_by_role("button",name="Menus").first.click();await pg.wait_for_timeout(2000)
    await pg.get_by_role("button",name="Add Menu Item").click();await pg.wait_for_timeout(800)
    await pg.screenshot(path="menu.png");print(pg.url,errs)
    await b.close()
asyncio.run(main())
