from playwright.sync_api import sync_playwright

def verify_metrics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for metrics to load/appear
        page.wait_for_selector("text=Equity Crossover")

        # Take screenshot of the metrics area
        # The metrics are in a grid. I'll take a screenshot of the whole page or target the grid.
        # "SummaryMetrics" is a grid. I can target it by class or content.
        # Let's take a full page screenshot to be safe.
        page.screenshot(path="verification/metrics.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_metrics()
