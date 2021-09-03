// r = Read, w = write, rw = ReadWrite
export const APP_PERMISSION = (window.location.pathname.split("/")[1] == "design" ? "rw" : 'w');
export const APP_DESIGN = (window.location.pathname.split("/")[1] == "design" ? true : false);
