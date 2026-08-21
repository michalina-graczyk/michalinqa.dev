module.exports = {
  ci: {
    collect: {
      chromePath: process.env.CHROME_PATH,
      url: [
        `${process.env.BASE_URL}/`,
        `${process.env.BASE_URL}/cv`,
        `${process.env.BASE_URL}/blog`,
        `${process.env.BASE_URL}/offers/audyt-jakosci`,
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --ignore-certificate-errors",
        skipAudits: ["uses-http2"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 180000 }],
        "resource-summary:stylesheet:size": [
          "error",
          { maxNumericValue: 180000 },
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
      outputDir: ".lighthouseci",
    },
  },
};
