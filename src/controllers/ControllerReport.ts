import { Request, Response } from "express";
import {compile as compileHTML} from 'handlebars';
import { create as createPDF, CreateOptions, FileInfo } from 'html-pdf';
import {readFileSync, createWriteStream} from 'graceful-fs';

export class ControllerReport {
    async pong (req: Request, resp: Response): Promise<void> {
        const pingPong = {
            ping: "pong"
        }
        resp.status(200).json(pingPong);
    }

    async createReport(req: Request, resp: Response): Promise<void>{
        try {

            const img = readFileSync('src/assets/logo.png').toString('base64');

            const reportTemplate = readFileSync('src/templates/report.handlebars', 'utf-8');

            let data = {...req.body, img: `data:image/png;base64,${img}`};
            const htmlDelegate = compileHTML(reportTemplate);
            const html = htmlDelegate(data);


            const options: CreateOptions = {
                height: `${(data.complaints.length * 500) + 250}px`,
                width: '900px'
            };

            createPDF(html, options).toStream((err, stream) => {
                if(err) return resp.status(400).json({"message": err});

                stream.pipe(createWriteStream(`src/${req.body.category}.pdf`));
            });

            resp.status(201).json({"msg": `Report created at src/${req.body.category}.pdf`});
        } catch(err) {
            resp.status(400).json({'msg': err});
        }
    }
}