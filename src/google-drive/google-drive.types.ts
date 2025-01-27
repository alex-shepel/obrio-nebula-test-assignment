export type DriveFileListResult = {
  fileUrl: string | null;
  fileName: string | null;
  fileId: string | null;
}

export type DriveFileSaveResult = (
  | DriveFileListResult
  | Pick<DriveFileListResult, 'fileUrl'> & { error: string }
);
