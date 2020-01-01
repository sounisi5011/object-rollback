export default [new Error('msg')].map(error => {
    error.stack = String(error);
    return error;
});
