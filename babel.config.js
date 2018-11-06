const presets = [
    [
        "@babel/env",
        {
            targets: "> 0.25%, not dead",
            useBuiltIns: "usage",
        },
    ],
    [
        "minify"
    ]
];
module.exports = { presets };