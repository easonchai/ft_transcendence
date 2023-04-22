import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { diskStorage } from 'multer';
import path from "path";
import { v4 as uuidv4 } from 'uuid';

type validMimeTypes = 'image/png' | 'image/jpeg' | 'image/jpg';
type validFileExtension = '.png' | '.jpeg' | '.jpg';

const allowedMimeTypes: validMimeTypes[] = ['image/jpeg', 'image/jpg', 'image/png'];
const allowedFileExtension: validFileExtension[] = ['.jpeg', '.jpg', '.png'];

export const ImageMulterOptions: MulterOptions = {
	fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
		if (allowedFileExtension.includes(path.extname(file.originalname) as validFileExtension) &&
			allowedMimeTypes.includes(file.mimetype as validMimeTypes) ) {
			callback(null, true);
		}
		callback(null, false);
	},
	storage: diskStorage({
		destination: './uploads',
		filename: (req, file, callback) => {
			const ext: string = path.extname(file.originalname);
			const filename: string = uuidv4();
			callback(null, `${filename}${ext}`);
		},
	}),
}