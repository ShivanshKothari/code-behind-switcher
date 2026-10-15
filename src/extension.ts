import * as vscode from 'vscode';

// Each rule links a "markup" side to one or more "code" side suffixes.
// F7 goes markup -> code, Shift+F7 goes code -> markup.
interface Rule {
  markup: string;
  code: string[];
}

export const RULES: Rule[] = [
  // ASP.NET WebForms
  { markup: '.aspx', code: ['.aspx.cs', '.aspx.vb'] },
  { markup: '.ascx', code: ['.ascx.cs', '.ascx.vb'] },
  { markup: '.master', code: ['.master.cs', '.master.vb'] },
  { markup: '.asmx', code: ['.asmx.cs', '.asmx.vb'] },
  { markup: '.ashx', code: ['.ashx.cs', '.ashx.vb'] },
  { markup: '.asax', code: ['.asax.cs', '.asax.vb'] },
  { markup: '.svc', code: ['.svc.cs', '.svc.vb'] },
  { markup: '.aspx.designer.cs', code: ['.aspx.cs'] },
  { markup: '.ascx.designer.cs', code: ['.ascx.cs'] },
  { markup: '.master.designer.cs', code: ['.master.cs'] },
  // XAML based: WPF, UWP, WinUI, MAUI, Xamarin.Forms, Avalonia
  { markup: '.xaml', code: ['.xaml.cs', '.xaml.vb', '.xaml.fs'] },
  { markup: '.axaml', code: ['.axaml.cs', '.axaml.vb'] },
  // Razor
  { markup: '.cshtml', code: ['.cshtml.cs'] },
  { markup: '.vbhtml', code: ['.vbhtml.vb'] },
  { markup: '.razor', code: ['.razor.cs', '.razor.css', '.razor.scss', '.razor.js'] },
  // WinForms / designer files
  { markup: '.Designer.cs', code: ['.cs'] },
  { markup: '.designer.cs', code: ['.cs'] },
  { markup: '.Designer.vb', code: ['.vb'] },
  { markup: '.resx', code: ['.cs', '.vb'] },
  // Angular components
  { markup: '.component.html', code: ['.component.ts'] },
  { markup: '.component.css', code: ['.component.ts'] },
  { markup: '.component.scss', code: ['.component.ts'] },
  { markup: '.component.sass', code: ['.component.ts'] },
  { markup: '.component.less', code: ['.component.ts'] },
  // C / C++ / Objective-C headers and sources
  { markup: '.h', code: ['.c', '.cpp', '.cc', '.cxx', '.m', '.mm'] },
  { markup: '.hpp', code: ['.cpp', '.cc', '.cxx'] },
  { markup: '.hh', code: ['.cc', '.cpp'] },
  { markup: '.hxx', code: ['.cxx', '.cpp'] },
  // Native UI / mobile
  { markup: '.xib', code: ['.m', '.swift'] },
  { markup: '.storyboard', code: ['.m', '.swift'] },
  { markup: '.ui', code: ['.cpp', '.py'] },
  { markup: '.fxml', code: ['.java', '.kt'] },
  // Others
  { markup: '.pxd', code: ['.pyx'] },
  { markup: '.mli', code: ['.ml'] },
  { markup: '.pyi', code: ['.py'] },
  { markup: '.d.ts', code: ['.js'] },
  { markup: '.html.erb', code: ['.rb'] },
];

const VIEW_MODEL_RULES = [
  { view: '.xaml', viewModel: 'ViewModel.cs' },
  { view: '.axaml', viewModel: 'ViewModel.cs' },
];

type Direction = 'code' | 'markup';

export function findCounterparts(filePath: string, direction: Direction): string[] {
  const lower = filePath.toLowerCase();
  const results: string[] = [];
  const seen = new Set<string>();

  const matches: { from: string; to: string[] }[] = [];
  for (const rule of RULES) {
    if (direction === 'code') {
      matches.push({ from: rule.markup, to: rule.code });
    } else {
      for (const code of rule.code) {
        matches.push({ from: code, to: [rule.markup] });
      }
    }
  }
  // Longest suffix first so e.g. ".aspx.cs" wins over ".cs"
  matches.sort((a, b) => b.from.length - a.from.length);

  for (const m of matches) {
    if (!lower.endsWith(m.from.toLowerCase())) {
      continue;
    }
    const stem = filePath.slice(0, filePath.length - m.from.length);
    if (!stem || stem.endsWith('\\') || stem.endsWith('/')) {
      continue;
    }
    for (const to of m.to) {
      const candidate = stem + to;
      if (!seen.has(candidate) && candidate.toLowerCase() !== lower) {
        seen.add(candidate);
        results.push(candidate);
      }
    }
  }

  for (const rule of VIEW_MODEL_RULES) {
    const from = direction === 'code' ? rule.view : rule.viewModel;
    if (!lower.endsWith(from.toLowerCase())) {
      continue;
    }
    const stem = filePath.slice(0, filePath.length - from.length);
    if (!stem || stem.endsWith('\\') || stem.endsWith('/')) {
      continue;
    }
    const candidate = stem + (direction === 'code' ? rule.viewModel : rule.view);
    if (!seen.has(candidate) && candidate.toLowerCase() !== lower) {
      seen.add(candidate);
      results.push(candidate);
    }
  }

  return results;
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function navigate(direction: Direction) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.uri.scheme !== 'file') {
    return;
  }
  const candidates = findCounterparts(editor.document.uri.fsPath, direction);
  const found: vscode.Uri[] = [];
  for (const c of candidates) {
    const uri = vscode.Uri.file(c);
    if (await exists(uri)) {
      found.push(uri);
    }
  }

  if (found.length === 0) {
    vscode.window.setStatusBarMessage(
      direction === 'code' ? 'No code-behind file found.' : 'No markup file found.',
      3000
    );
    return;
  }

  let target = found[0];
  if (found.length > 1) {
    const pick = await vscode.window.showQuickPick(
      found.map(u => ({ label: vscode.workspace.asRelativePath(u), uri: u })),
      { placeHolder: 'Select the related file to open' }
    );
    if (!pick) {
      return;
    }
    target = pick.uri;
  }
  await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(target));
}

function updateContext(editor: vscode.TextEditor | undefined) {
  const path = editor && editor.document.uri.scheme === 'file' ? editor.document.uri.fsPath : '';
  const canCode = path !== '' && findCounterparts(path, 'code').length > 0;
  const canMarkup = path !== '' && findCounterparts(path, 'markup').length > 0;
  vscode.commands.executeCommand('setContext', 'viewCodeBehind.canViewCode', canCode);
  vscode.commands.executeCommand('setContext', 'viewCodeBehind.canViewMarkup', canMarkup);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.viewCode', () => navigate('code')),
    vscode.commands.registerCommand('extension.viewMarkup', () => navigate('markup')),
    vscode.window.onDidChangeActiveTextEditor(updateContext)
  );
  updateContext(vscode.window.activeTextEditor);
}

export function deactivate() {}
