export default [
    () => 42,
    async () => 42,
    Math.sin,
    class Std {},
    new Function(), // eslint-disable-line no-new-func
];
