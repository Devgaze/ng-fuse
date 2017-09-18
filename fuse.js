const {
  FuseBox, SassPlugin, CSSPlugin, WebIndexPlugin,
  JSONPlugin, HTMLPlugin, RawPlugin, Sparky,
  TypeScriptHelpers, QuantumPlugin } = require('fuse-box');
const { Ng2TemplatePlugin } = require('ng2-fused');
const { Ng2RouterPlugin } = require('ng2-fused');

let fuse, app, vendor, isProduction;

Sparky.task('config', () => {

  fuse = FuseBox.init({
    homeDir: './src',
    output: './dist/$name.js',
    target: 'browser',
    hash: isProduction,
    plugins: [
      Ng2TemplatePlugin(),
      ['*.component.html', RawPlugin()],
      ['*.component.scss', SassPlugin(), RawPlugin()],
      HTMLPlugin({ useDefault: false }),
      [SassPlugin(), CSSPlugin()],
      WebIndexPlugin({ title: 'Frameless.life', template: './src/index.html' }),
      TypeScriptHelpers(),
      JSONPlugin(),
      isProduction && QuantumPlugin({
        uglify: true,
        hoisting: { names: ["tslib_1"] },
        treeshake: true
      }),
    ]
  });

  vendor =  fuse.bundle('vendor')
                .instructions(' ~ main.ts');

  app = fuse.bundle('app')
            .sourceMaps(!isProduction)
            .instructions(' !> [main.ts]');

});

Sparky.task("clean", () => Sparky.src("dist/").clean("dist/"));
Sparky.task("default", ["clean", "config"], () => {
  fuse.dev();
  app.watch().hmr()
  return fuse.run();
});

Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("dist", ["prod-env", "config"], () => {
  return fuse.run();
});
