## Inline type hints

VS Code enables **inlay hints** by default. For WitcherScript, these show parameter names in fucntion calls

**Off unless pressed** is recommended: it avoids adding clutter, but allows quick peeking: hold `Ctrl` + `Alt` to reveal the hints on demand.

<checklist>
	<div class="theme-picker-row">
		<checkbox when-checked="command:witcherscript.inlayHints.offUnlessPressed" checked-on="witcherscript.inlayHintsMode == 'offUnlessPressed'">
			<img width="200" src="./inlay-hints-off-unless-pressed.svg"/>
			Off unless pressed
		</checkbox>
		<checkbox when-checked="command:witcherscript.inlayHints.off" checked-on="witcherscript.inlayHintsMode == 'off'">
			<img width="200" src="./inlay-hints-off.svg"/>
			Off
		</checkbox>
	</div>
	<div class="theme-picker-row">
		<checkbox when-checked="command:witcherscript.inlayHints.onUnlessPressed" checked-on="witcherscript.inlayHintsMode == 'onUnlessPressed'">
			<img width="200" src="./inlay-hints-on-unless-pressed.svg"/>
			On unless pressed
		</checkbox>
		<checkbox when-checked="command:witcherscript.inlayHints.on" checked-on="witcherscript.inlayHintsMode == 'on'">
			<img width="200" src="./inlay-hints-on.svg"/>
			On
		</checkbox>
	</div>
</checklist>
