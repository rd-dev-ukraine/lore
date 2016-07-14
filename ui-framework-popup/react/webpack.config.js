module.exports = {
    debug: true,
    entry: "./app/app.tsx",
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