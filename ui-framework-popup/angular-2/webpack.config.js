module.exports = {
    debug: true,
    entry: ["reflect-metadata", "zone.js", "./app/main.ts"],
    output: {
        filename: "app.js",
        publicPath: "/dist/",
        path: "./dist"
    },
    devtool: "source-map",
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js", ".tsx"]
    },
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: "ts-loader"
        }]
    },
    ts: {
        compilerOptions: {
            noEmit: false
        }
    }
};