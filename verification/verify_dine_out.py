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

        # Check Sidebar for "Dining Out"
        dine_out_label = page.locator("aside").get_by_text("Dining Out")
        dine_out_label.scroll_into_view_if_needed()
        expect(dine_out_label).to_be_visible()

        print("Sidebar inputs verified.")

        # Check Chart
        # Heading "Lifestyle Breakdown"
        # We assume the chart renders. We can check for the legend item "Dining Out" if possible.
        # Legend items usually have text.
        # .recharts-legend-item-text
        chart_legend_dine_out = page.locator(".recharts-legend-item-text").get_by_text("Dining Out")
        # Might need to scroll to chart
        chart_heading = page.get_by_role("heading", name="Lifestyle Breakdown")
        chart_heading.scroll_into_view_if_needed()

        expect(chart_legend_dine_out).to_be_visible()

        print("Chart verified.")

        # Take Screenshot
        page.screenshot(path="/home/jules/verification/dine_out_verification.png")

        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    run()
