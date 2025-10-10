import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_ui(page: Page):
    """
    Navigates to the Deep-Sensing Studio and captures a screenshot of the main dashboard.
    """
    # 1. Arrange: Go to the running application.
    page.goto("http://localhost:5173")

    # 2. Assert: Wait for the main heading to be visible to ensure the page is loaded.
    expect(page.get_by_role("heading", name="Deep-Sensing Studio")).to_be_visible()

    # 3. Act: Give the components a moment to settle their layout and animations.
    page.wait_for_timeout(1000)

    # 4. Screenshot: Capture the entire dashboard for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_ui(page)
        browser.close()