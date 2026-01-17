from playwright.sync_api import sync_playwright, expect
import time
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1400, "height": 1000})
        page = context.new_page()

        print("Waiting for server...")
        # Wait for server
        connected = False
        for i in range(30):
            try:
                page.goto("http://localhost:3000", timeout=2000)
                connected = True
                break
            except Exception as e:
                time.sleep(1)

        if not connected:
            print("Failed to connect to server")
            browser.close()
            return

        print("Connected. Verifying content...")

        # Check Sidebar for Lifestyle Expenses
        # It's an uppercase h2 inside a button: "LIFESTYLE EXPENSES"
        # Locator might be case sensitive depending on how it's rendered (CSS uppercase vs text)
        # In Sidebar.tsx: <h2 ... uppercase ...>{title}</h2>
        # So text is "Lifestyle Expenses", CSS transforms it. Playwright sees the text in DOM usually.
        # But get_by_role('button', name='Lifestyle Expenses') should work.
        lifestyle_btn = page.get_by_role("button", name="Lifestyle Expenses")
        expect(lifestyle_btn).to_be_visible()

        # Ensure it's open (default is true)
        # Check for inputs
        # We scroll to Utilities to make sure it's in view
        # Use aside to target sidebar only
        utilities_label = page.locator("aside").get_by_text("Utilities")
        utilities_label.scroll_into_view_if_needed()
        expect(utilities_label).to_be_visible()

        expect(page.locator("aside").get_by_text("Car Payment")).to_be_visible()
        expect(page.locator("aside").get_by_text("Car Insurance & Gas")).to_be_visible()
        expect(page.locator("aside").get_by_text("Food & Essentials")).to_be_visible()

        print("Sidebar inputs verified.")

        # Check Chart
        # Heading "Lifestyle Breakdown"
        # It's an h3 in the chart component.
        chart_heading = page.get_by_role("heading", name="Lifestyle Breakdown")
        chart_heading.scroll_into_view_if_needed()
        expect(chart_heading).to_be_visible()

        print("Chart verified.")

        # Take Screenshot
        # We want to see the sidebar inputs and the chart.
        # Since sidebar is scrollable, we might want to verify it's positioned to show our new inputs.
        # We already scrolled 'Utilities' into view.
        page.screenshot(path="/home/jules/verification/lifestyle_verification.png")

        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    run()
