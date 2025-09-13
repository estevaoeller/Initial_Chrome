import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import {
  loadBookmarksFromChrome,
  addBookmarkToChrome,
  removeBookmarkFromChrome,
} from '../js/modules.js';

describe('Chrome bookmark functions', () => {
  beforeEach(() => {
    globalThis.chrome = {
      bookmarks: {
        getTree: jest.fn(),
        getSubTree: jest.fn(),
        getChildren: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
      },
      runtime: { lastError: null },
    };
  });

  test('loadBookmarksFromChrome returns categories', done => {
    const tree = [
      {
        id: '0',
        title: 'root',
        children: [{ id: '1', title: 'Pagina Inicial', children: [] }],
      },
    ];
    chrome.bookmarks.getTree.mockImplementation(cb => cb(tree));
    chrome.bookmarks.getSubTree.mockImplementation((id, cb) => {
      cb([
        {
          id: '1',
          children: [
            {
              id: '10',
              title: 'Cat1',
              children: [{ id: '100', title: 'Link1', url: 'http://a.com' }],
            },
          ],
        },
      ]);
    });

    loadBookmarksFromChrome(categories => {
      expect(categories).toEqual([
        { name: 'Cat1', links: [{ name: 'Link1', url: 'http://a.com' }] },
      ]);
      done();
    });
  });

  test('addBookmarkToChrome adds bookmark to existing category', done => {
    const bookmark = { name: 'Link', url: 'http://example.com' };
    chrome.bookmarks.getTree.mockImplementation(cb =>
      cb([
        {
          id: '0',
          title: 'root',
          children: [{ id: '1', title: 'Pagina Inicial', children: [] }],
        },
      ]),
    );
    chrome.bookmarks.getChildren.mockImplementation((id, cb) => {
      if (id === '1') cb([{ id: 'cat1', title: 'Cat', url: undefined }]);
      else cb([]);
    });
    chrome.bookmarks.create.mockImplementation((_data, cb) => cb());

    addBookmarkToChrome('Cat', bookmark, () => {
      expect(chrome.bookmarks.create).toHaveBeenCalledWith(
        { parentId: 'cat1', title: 'Link', url: 'http://example.com' },
        expect.any(Function),
      );
      done();
    });
  });

  test('removeBookmarkFromChrome removes bookmark from category', done => {
    const url = 'http://example.com';
    chrome.bookmarks.getTree.mockImplementation(cb =>
      cb([
        {
          id: '0',
          title: 'root',
          children: [{ id: '1', title: 'Pagina Inicial', children: [] }],
        },
      ]),
    );
    chrome.bookmarks.getChildren.mockImplementation((id, cb) => {
      if (id === '1') cb([{ id: 'cat1', title: 'Cat', url: undefined }]);
      else if (id === 'cat1') cb([{ id: 'bm1', url }]);
    });
    chrome.bookmarks.remove.mockImplementation((_id, cb) => cb());

    removeBookmarkFromChrome('Cat', url, () => {
      expect(chrome.bookmarks.remove).toHaveBeenCalledWith(
        'bm1',
        expect.any(Function),
      );
      done();
    });
  });
});

