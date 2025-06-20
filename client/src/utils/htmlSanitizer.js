export function removeColorStyles(html) {
  // Removes any inline color styles (e.g., style="color: rgb(0, 0, 0);")
  return html.replace(/style="[^"]*color:[^;"]*;?[^"]*"/gi, '');
}
