import { drive_v3 } from 'googleapis/build/src/apis/drive';

export interface DriveFile extends drive_v3.Schema$File {}

export type SaveDriveFileResult = {
  fileUrl: string;
  fileName: string;
  fileId: string;
} | {
  fileUrl: string;
  error: string;
}
