import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { findCounterparts } from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('finds XAML ViewModels alongside code-behind files', () => {
		assert.deepStrictEqual(
			findCounterparts('C:\\app\\MainPage.xaml', 'code'),
			['C:\\app\\MainPage.xaml.cs', 'C:\\app\\MainPage.xaml.vb', 'C:\\app\\MainPage.xaml.fs', 'C:\\app\\MainPageViewModel.cs']
		);
	});

	test('navigates from a ViewModel to its XAML view', () => {
		assert.ok(findCounterparts('C:\\app\\MainViewModel.cs', 'markup').includes('C:\\app\\Main.xaml'));
	});

	test('finds Avalonia ViewModels and preserves case-insensitive matching', () => {
		const candidates = findCounterparts('C:\\app\\MainViewModel.CS', 'markup');
		assert.ok(candidates.includes('C:\\app\\Main.xaml'));
		assert.ok(candidates.includes('C:\\app\\Main.axaml'));
	});

	test('does not treat unrelated C# files as ViewModels', () => {
		const candidates = findCounterparts('C:\\app\\Main.cs', 'markup');
		assert.ok(!candidates.includes('C:\\app\\Main.xaml'));
		assert.ok(!candidates.includes('C:\\app\\Main.axaml'));
	});

	test('preserves existing XAML code-behind navigation', () => {
		assert.ok(
			findCounterparts('C:\\app\\MainPage.xaml.cs', 'markup').includes('C:\\app\\MainPage.xaml')
		);
	});
});
