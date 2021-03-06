'use strict';
const chai = require('chai');
const spies = require('chai-spies');
var mock = require('mock-require');

chai.use(spies);
const expect = chai.expect;

const cssMinifier = require('../lib/optimizeCSS');

describe('OptimizeCSS', () => {

  it('should do nothing if options.enable is false', () => {
    const hexo = {
      config: {
        css_minifier: {
          enable: false,
        }
      },
      log: {
        info: () => {}
      }
    };
    expect(cssMinifier.call(hexo)).to.be.undefined;
  });

  describe('exclude options', () => {
    it('should warp the exclude to an array if it is not an array', () => {
      const hexo = {
        config: {
          css_minifier: {
            enable: true,
            exclude: 'src/**/*'
          }
        },
        log: {
          info: () => {}
        }
      };
      const str = 'strstr';
      const datas = [{ path: 'src/usr/absolute' }, { path: 'src/test.txt' }];
      for (const data of datas) {
        expect(cssMinifier.call(hexo, str, data)).to.deep.equal(str);
      }
    });
  });

  it('should minify css', () => {
    const hexo = {
      config: {
        css_minifier: {
          enable: true,
          exclude: 'src/**/*'
        }
      },
      log: {
        info: () => {}
      }
    };
    const data = { str:'h { background: red;     }', path: 'test.txt' };
    expect(cssMinifier.call(hexo, data.str, data)).to.have.length.lessThan(data.str.length);

    const excludeData = { str:'h { background: red;     }', path: 'src/usr/absolute' };
    expect(cssMinifier.call(hexo, excludeData.str, excludeData)).to.deep.equal(excludeData.str);
  });

  it('should log when minifier warnings occur', () => {
    const hexo = {
      config: {
        css_minifier: {
          enable: true,
        }
      },
      log: {
        warn: chai.spy()
      }
    };
    const data = { str:'h  background: red;     }', path: 'test.txt' };
    cssMinifier.call(hexo, data.str, data)
    expect(hexo.log.warn).to.have.been.called();
  });

  it('should log when minifier errors occur', () => {
    const hexo = {
      config: {
        css_minifier: {
        }
      },
      log: {
        error: chai.spy()
      }
    };
    const data = { str:'@import url(/path/to/styles);', path: 'test.txt' };
    cssMinifier.call(hexo, data.str, data)
    expect(hexo.log.error).to.have.been.called();
  });

  it('should log when catastrophic errors occur', () => {
    const error = new Error('catastrophic error');

    mock('clean-css', function() {
      throw(error);
    });

    const cssMinifier = mock.reRequire('../lib/optimizeCSS');

    const hexo = {
      config: {
        css_minifier: {
          enable: true,
        }
      },
      log: {
        error: chai.spy()
      }
    };
    const data = { str:'h  backgroun: red;     }', path: 'test.txt' };
    cssMinifier.call(hexo, data.str, data)
    expect(hexo.log.error).to.have.been.called();
  });

  it('should return the original styles when catastrophic errors occur', () => {
    const error = new Error('catastrophic error');

    mock('clean-css', function() {
      throw(error);
    });

    const cssMinifier = mock.reRequire('../lib/optimizeCSS');

    const hexo = {
      config: {
        css_minifier: {
          enable: true,
        }
      },
      log: {
        error: () => {}
      }
    };
    const data = { str:'h  backgroun: red;     }', path: 'test.txt' };
    expect(cssMinifier.call(hexo, data.str, data)).to.equal(data.str);
  });
});

