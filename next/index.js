import fs from "fs";
import express from "express";
import cors from "cors";
import { glob } from "glob";
import { fileURLToPath } from 'url';
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

let serverSideFileModules = {};
let clientSideFilePath = [];
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) + "/../";

(async() => {
const serverSideFiles = (await glob("pages/**/*"))
                .filter((file) => file.match(/getServerSideProps\.js$/g))
                .map((file) => ["../" + file, file]);
const loadServerSideFiles = (files) => {
    return Promise.all(
        files.map(async(filePath) => {
        const filePathName = filePath[1].slice(6, -22);
        serverSideFileModules[filePathName] = await import(filePath[0]);
    }));
}
const clientSideFiles = (await glob("pages/**/*"))
                .filter((file) => file.match(/\.jsx/g))
                .map((file) => ["./" + file, file]);
await loadServerSideFiles(serverSideFiles)

const server = app.listen(3002, function(){
    console.log("Node.js is listening to Port 3002");
});

const corsOption = {
    origin: "http://localhost:8888",
    optionsSuccessStatus: 200
}

Object.keys(serverSideFileModules).forEach((filePath) => {
    app.get(`/json/${filePath}`, cors(corsOption), async function(req, res, next){
        res.json(await serverSideFileModules[filePath].default());
    })
});

const loadClientFiles = (files) => {
return Promise.all(
    files.map(async(filePath) => {
        const originalFileContent = fs.readFileSync("./next/page.jsx", "utf-8");
        const filePathName = filePath[1].slice(6, -10);
        const filePathSlashCount = (filePathName.match(/(\/)/g) ?? []).length;
        const appPath = filePathSlashCount === 0
            ? `../../pages/${filePathName}/index.jsx`
            : `../..${"/..".repeat(filePathSlashCount)}/pages/${filePathName}/index.jsx`
        const axiosPath = `http://localhost:3002/json/${filePathName}`
        const fileHeader = `/** @jsx React.createElement */
import axios from "axios";
import React from "react";
import { createRoot } from 'react-dom/client';
import App from '${appPath}';
let props;
(async () => {
const axiosResult = await axios.get("${axiosPath}");
props = axiosResult.data;
`
        const fileFooter = "\n})()";
        const fileContent = fileHeader + originalFileContent + fileFooter;
        const writeFolderPath = `./next_client/${filePathName}`
        const writeFileName = filePath[1].slice(6);
        const writeFilePath = `./next_client/${writeFileName}`;
        await fs.mkdirSync(writeFolderPath, { recursive: true });
        await fs.writeFileSync(writeFilePath, fileContent);
        return writeFilePath;
    })
)}
clientSideFilePath = await loadClientFiles(clientSideFiles);
const srcFiles = (await glob("src/**/*")).map((file) => "./" + file);
const pagesFiles = (await glob("pages/**/*")).map((file) => "./" + file);

clientSideFilePath.forEach((clientFile, index) => {
    const config = {
        context: __dirname,
        mode: "development",
        entry: [...srcFiles, ...pagesFiles, clientFile],
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: `bundle_${index}.js`
        },
        module: {
            rules: [
                {
                    test: /\.jsx|js$/,
                    include: [/node_modules/, path.resolve(__dirname, 'src'), /pages\/[\w\/]+(?!getServerSideProps.js)/, /next_client/],
                    // /pages\/[\w\/]+(?!getServerSideProps.js)/
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-react", "@babel/preset-env"],
                        }
                    },
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
            })
        ]
    }
    const compiler = webpack(config);
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;
    compiler.run((err, stats) => {
        if (err) console.log(err);
        // console.log(stats);
    });
})

clientSideFilePath.forEach(async (filePath, index) => {
    const filePathName = filePath.slice(14, -10);
    app.get(`/${filePathName}`, cors(corsOption), async function(req, res, next){
        let HTMLContent = await fs.readFileSync(`dist/index.html`, "utf-8");
        const scriptContent = await fs.readFileSync(`dist/bundle_${index}.js`, 'utf-8');
        HTMLContent += `<script>${scriptContent}</script>`
        res.send(HTMLContent);
    })
});

})()
