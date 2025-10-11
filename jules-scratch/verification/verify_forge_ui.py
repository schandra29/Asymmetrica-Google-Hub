from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000/forge")

    # 1. Verify Crucible Inlet is visible
    expect(page.get_by_text("Drag 'n' drop some files here")).to_be_visible()

    # 2. Upload a file
    page.set_input_files('input[type="file"]', [
        dict(name='file1.txt', mimeType='text/plain', data=b'This is a test file.')
    ])

    # 3. Verify ForgeButton is enabled and click it
    forge_button = page.get_by_role("button", name="FORGE")
    expect(forge_button).to_be_enabled()
    forge_button.click()

    # 4. Wait for AnvilSearch to appear
    anvil_search = page.get_by_placeholder("Query the purified data...")
    expect(anvil_search).to_be_visible(timeout=10000)

    # 5. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)