const path = require('path');
const fs = require('fs');

function findDirWithFile(filename) {
  let dir = path.resolve(filename);
  do {
    dir = path.dirname(dir);
  } while (!fs.existsSync(path.join(dir, filename)) && dir !== '/');

  if (!fs.existsSync(path.join(dir, filename))) {
    return;
  }

  return dir;
}

function getBaseUrl() {
  const baseDir = findDirWithFile('package.json');
  let url = '';

  ['jsconfig.json', 'tsconfig.json'].forEach((filename) => {
    const fpath = path.join(baseDir, filename);
    if (fs.existsSync(fpath)) {
      const config = JSON.parse(fs.readFileSync(fpath));
      if (config && config.compilerOptions && config.compilerOptions.baseUrl) {
        url = config.compilerOptions.baseUrl;
      }
    }
  });

  return path.join(baseDir, url);
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Кастомный плагин, смотрит на импорты и проверяет чтобы не было вложенных' +
        ' импортов больше определнного количества и подменяет их на' +
        ' абсолютный импорт, уровень допустимой вложенности' +
        ' определяется параметром maxLevel, также надо указать параметр baseUrl,' +
        ' чтобы он подставлял значение для абсолютного импорта, baseUrl по' +
        ' умолчанию @. Правило называется no-relative-parent-imports',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      main: 'Replace relative import with an absolute import path.',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          maxLevel: {
            type: 'integer',
            minimum: 0,
          },
          baseUrl: {
            type: 'string'
          },
          noAlias: {
            type: 'boolean'
          }
        },
        additionalProperties: {
          type: 'object',
          properties: {
            maxLevel: {
              type: 'integer',
              minimum: 0,
            },
            baseUrl: {
              type: 'string'
            },
            noAlias: {
              type: 'boolean'
            }
          },
        }
      },
    ],
  },

  create(context) {
    const baseUrlInSystem = getBaseUrl();
    const {maxLevel = 3, baseUrl = '@', noAlias = false} = context.options[0] || {};

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        if (node.source.value.startsWith('../')) {
          const relativePath = node.source.value;
          const filename = context.getFilename();
          const nestedPathsCount = (relativePath.match(/\.\.\//g) || []).length;

          const absoluteImportPath = path.normalize(
            path.join(path.dirname(filename), importSource),
          );
          const expectedPath = path.relative(
            baseUrlInSystem,
            absoluteImportPath,
          );
          const pathWithoutBaseFolder = expectedPath.substring(
            expectedPath.indexOf('/'),
            expectedPath.length,
          );
          const resultPath = noAlias ? pathWithoutBaseFolder.substring(1) : `${baseUrl}${pathWithoutBaseFolder}`;

          if (nestedPathsCount > maxLevel) {
            context.report({
              node,
              messageId: 'main',
              suggest: [
                {
                  desc: `Replace relative import with ${resultPath}`,
                  fix: function (fixer) {
                    return fixer.replaceText(node.source, `'${resultPath}'`);
                  },
                },
              ],
            });
          }
        }
      },
    };
  },
};

module.exports = {
  rules: {
    'no-relative-parent-imports': rule,
  },
  configs: {
    all: {
      rules: {
        'no-relative-parent-imports': 2,
      },
    },
    'all-warn': {
      rules: {
        'no-relative-parent-imports': 1,
      },
    },
    recommended: {
      rules: {
        'no-relative-parent-imports': 1,
      },
    },
  },
};
