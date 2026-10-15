# Code-Behind Switcher

Jump between a markup/design file and its code-behind (or related) file.

## Mention
- Forked from ncthanh088/view-code-behind

## Usage
- `F7`: go to the code file
- `Shift+F7`: go to the markup file
- Or right-click in the editor and choose **View Code** / **View Markup** (shown only when a counterpart applies).

If several related files exist (e.g. `.razor.cs` and `.razor.css`), you pick one from a list.

## Supported file pairs
| Markup | Code |
|---|---|
| `.aspx` `.ascx` `.master` `.asmx` `.ashx` `.asax` `.svc` | same + `.cs` / `.vb` |
| `.xaml` (WPF, UWP, WinUI, MAUI, Xamarin) | `.xaml.cs` / `.xaml.vb` / `.xaml.fs` |
| `.axaml` (Avalonia) | `.axaml.cs` / `.axaml.vb` |
| `.cshtml` / `.vbhtml` | `.cshtml.cs` / `.vbhtml.vb` |
| `.razor` | `.razor.cs` / `.razor.css` / `.razor.scss` / `.razor.js` |
| `.Designer.cs` / `.Designer.vb` (WinForms) | `.cs` / `.vb` |
| `.resx` | `.cs` / `.vb` |
| `.component.html/css/scss/sass/less` (Angular) | `.component.ts` |
| `.h` `.hpp` `.hh` `.hxx` | `.c` `.cpp` `.cc` `.cxx` `.m` `.mm` |
| `.xib` / `.storyboard` | `.m` / `.swift` |
| `.ui` (Qt) | `.cpp` / `.py` |
| `.fxml` (JavaFX) | `.java` / `.kt` |
| `.pxd` / `.mli` / `.pyi` / `.d.ts` / `.html.erb` | `.pyx` / `.ml` / `.py` / `.js` / `.rb` |

## License
This extension is licensed under the [MIT License](LICENSE.md).
