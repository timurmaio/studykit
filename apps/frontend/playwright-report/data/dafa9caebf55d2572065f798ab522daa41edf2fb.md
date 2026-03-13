# Page snapshot

```yaml
- alert [ref=e2]:
  - generic [ref=e3]:
    - heading "Page not found" [level=1] [ref=e4]
    - paragraph [ref=e5]: The requested page could not be found.
    - generic [ref=e6]:
      - button "Reload" [ref=e7] [cursor=pointer]:
        - generic [ref=e8]: Reload
      - link "Back to Home" [ref=e9] [cursor=pointer]:
        - /url: /
        - button "Back to Home" [ref=e10]:
          - generic [ref=e11]: Back to Home
```