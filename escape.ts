function findAllIndex(s: string, pattern: RegExp): number[] {
    const indexList = [0];
    let match;
    while ((match = pattern.exec(s)) !== null) {
        if (match[1] !== undefined) {
            indexList.push(match.index + match[0].indexOf(match[1]));
            indexList.push(match.index + match[0].indexOf(match[1]) + match[1].length);
        }
    }
    indexList.push(s.length);
    return indexList;
  }
  
  function replaceAll(text: string, pattern: RegExp, func: (t: string) => string): string {
    const poslist = findAllIndex(text, pattern);
    const replaced: string[] = [];
    const original: string[] = [];
  
    for (let i = 1; i < poslist.length - 1; i += 2) {
        replaced.push(func(text.substring(poslist[i], poslist[i + 1])));
    }
  
    for (let i = 0; i < poslist.length; i += 2) {
        if (i + 1 < poslist.length) {
            original.push(text.substring(poslist[i], poslist[i + 1]));
        }
    }
  
    if (replaced.length < original.length) {
        replaced.push("");
    } else {
        original.push("");
    }
  
    const merged: string[] = [];
    for (let i = 0; i < Math.max(original.length, replaced.length); i++) {
        if (original[i]) merged.push(original[i]);
        if (replaced[i]) merged.push(replaced[i]);
    }
  
    return merged.join("");
  }
  
  function escapeShape(t: string): string {
    return `▎*${t.split(' ')[1]}*`;
  }
  
  function escapeMinus(t: string): string {
    return `\\${t}`;
  }
  
  function escapeBackquote(_: string): string {
    return "\\`\\`";
  }
  
  function escapePlus(t: string): string {
    return `\\${t}`;
  }
  
  export const escape = async (text: string, flag = 0): Promise<string> => {
    if (flag) {
        text = text.replace(/\\\\/g, '@@@');
    }
    text = text.replace(/\\/g, '\\\\');
    if (flag) {
        text = text.replace(/@@@/g, '\\\\');
    }
  
    text = text.replace(/_/g, '\\_');
    text = text.replace(/\*{2}(.*?)\*{2}/g, '@@@$1@@@');
    text = text.replace(/\n{1,2}\*\s/g, '\n\n• ');
    text = text.replace(/\*/g, '\\*');
    text = text.replace(/@@@(.*?)@@@/g, '*$1*');
  
    text = text.replace(/!?\[(.*?)\]\((.*?)\)/g, '@@@$1@@@^^^$2^^^');
    text = text.replace(/\[/g, '\\[');
    text = text.replace(/\]/g, '\\]');
    text = text.replace(/\(/g, '\\(');
    text = text.replace(/\)/g, '\\)');
    text = text.replace(/@@@(.*?)@@@\^{3}(.*?)\^{3}/g, '[$1]($2)');
  
    text = text.replace(/~/g, '\\~');
    text = text.replace(/>/g, '\\>');
  
    text = replaceAll(text, /(^#+\s.+?$)|```[\s\S]+?```/g, escapeShape);
    text = text.replace(/#/g, '\\#');
  
    text = replaceAll(text, /(\+)|\n[\s]*-\s|```[\s\S]+?```|`[\s\S]*?`/g, escapePlus);
    text = text.replace(/\n{1,2}(\s*)-\s/g, '\n\n$1• ');
    text = text.replace(/\n{1,2}(\s*\d{1,2}\.\s)/g, '\n\n$1');
    text = replaceAll(text, /(-)|\n[\s]*-\s|```[\s\S]+?```|`[\s\S]*?`/g, escapeMinus);
  
    text = text.replace(/```([\s\S]+?)```/g, '@@@$1@@@');
    text = replaceAll(text, /(``)/g, escapeBackquote);
    text = text.replace(/@@@([\s\S]+?)@@@/g, '```$1```');
  
    text = text.replace(/([=|{}.!])/g, '\\$1');
  
    return text;
  };