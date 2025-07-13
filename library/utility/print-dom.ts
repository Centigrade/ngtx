import { DebugElement } from '@angular/core';
import { isDebugElement, isNativeElement } from './type-guards';

// ---------------------------------------------
// ----------- Module Public API ---------------
// ---------------------------------------------

// TODO: langju: clean up printing!
export function toHtmlString(
  node: DebugElement | Node,
  indentation = '',
): string {
  const nativeElement = isDebugElement(node) ? node.nativeElement : node;
  const elements = printNative(nativeElement, indentation);

  return elements.filter((element) => !!element).join('\n');
}

function printNative(node: Node, indentation: string): string[] {
  const children: string[] = [];

  if (node.childNodes.length > 0) {
    const printedChildren = Array.from(node.childNodes).map((child) =>
      toHtmlString(child, indentation + '  '),
    );

    children.push(...printedChildren.reverse());
  }

  return printNode(node, children, indentation);
}

function printNode(
  node: Node,
  children: string[],
  indentation: string,
): string[] {
  if (node.nodeName === '#text' || node.nodeName === '#comment') {
    return [];
  }

  const { tagName, elementBeginString } = beginElement(node, indentation);

  children.push(elementBeginString);
  const reversed = children.reverse();

  endElement(node, tagName, reversed, indentation);

  return reversed;
}

function beginElement(node: Node, indentation: string) {
  const tagName = node.nodeName.toLowerCase();
  const attributes = getAttributes(node);
  const elementBeginString = `${indentation}<${tagName}${attributes}>`;

  return { tagName, elementBeginString };
}

function endElement(
  node: Node,
  tagName: string,
  childrenReversed: string[],
  indentation: string,
) {
  const textChildren = Array.from(node.childNodes).filter(
    (child) => child.nodeName === '#text',
  );

  if (textChildren.length > 0) {
    const text = textChildren.map((child) => child.nodeValue).join(' ');
    const content = `${indentation}  ${text}`;
    childrenReversed.push(content);
  } else if (node.childNodes.length === 0) {
    if (tagName === 'input' || tagName === 'br') {
      childrenReversed[0] = childrenReversed[0].replace('>', ' />');
    } else {
      childrenReversed[0] += `</${tagName}>`;
    }

    return;
  }

  const endTag = `${indentation}</${tagName}>`;
  childrenReversed.push(endTag);
}

function getAttributes(node: Node) {
  if (!isNativeElement(node)) {
    return '';
  }

  const attributeNames = node.getAttributeNames();
  const attributes = attributeNames.map((name) => printAttribute(name, node));

  return attributes.length ? ' ' + attributes.join(' ') : '';
}

function printAttribute(name: string, node: Element): string {
  const attrName = name;
  const value = node.getAttribute(name);
  const attrValue = `"${value}"`;

  return `${attrName}=${attrValue}`;
}
