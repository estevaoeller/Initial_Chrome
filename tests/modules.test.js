import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import {
  loadBookmarksFromChrome,
  addBookmarkToChrome,
  removeBookmarkFromChrome,
  loadCustomIcons,
  saveCustomIconProps,
  removeCustomIconProps,
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
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn(),
        },
        sync: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn(),
        }
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
        { id: '10', name: 'Cat1', links: [{ id: '100', name: 'Link1', url: 'http://a.com' }] },
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
    chrome.bookmarks.create.mockImplementation((data, cb) => cb({ id: 'mock-id', ...data }));

    addBookmarkToChrome('1', 'Cat', bookmark, () => {
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

    removeBookmarkFromChrome('1', 'Cat', url, () => {
      expect(chrome.bookmarks.remove).toHaveBeenCalledWith(
        'bm1',
        expect.any(Function),
      );
      done();
    });
  });

  test('saveCustomIconProps registers key in customIconsKeys and saves property', done => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => {
      expect(keys).toEqual(['customIconsKeys']);
      cb({ customIconsKeys: ['icon:another-bookmark'] });
    });
    chrome.storage.sync.set.mockImplementation((data, cb) => {
      expect(data).toEqual({
        'icon:bm-1': { type: 'custom', value: 'custom-icon-url' },
        customIconsKeys: ['icon:another-bookmark', 'icon:bm-1']
      });
      cb();
    });

    saveCustomIconProps('bm-1', { type: 'custom', value: 'custom-icon-url' }, () => {
      expect(chrome.storage.sync.get).toHaveBeenCalled();
      expect(chrome.storage.sync.set).toHaveBeenCalled();
      done();
    });
  });

  test('removeCustomIconProps removes key from customIconsKeys and removes property', done => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => {
      expect(keys).toEqual(['customIconsKeys']);
      cb({ customIconsKeys: ['icon:another-bookmark', 'icon:bm-1'] });
    });
    chrome.storage.sync.remove.mockImplementation((key, cb) => {
      expect(key).toBe('icon:bm-1');
      cb();
    });
    chrome.storage.sync.set.mockImplementation((data, cb) => {
      expect(data).toEqual({
        customIconsKeys: ['icon:another-bookmark']
      });
      cb();
    });

    removeCustomIconProps('bm-1', () => {
      expect(chrome.storage.sync.get).toHaveBeenCalled();
      expect(chrome.storage.sync.remove).toHaveBeenCalled();
      expect(chrome.storage.sync.set).toHaveBeenCalled();
      done();
    });
  });

  test('loadCustomIcons loads registry keys when present', done => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => {
      if (Array.isArray(keys) && keys.includes('customIconsKeys')) {
        cb({ customIconsKeys: ['icon:bm-1'], customIconsInitialized: true });
      } else if (Array.isArray(keys) && keys.includes('icon:bm-1')) {
        cb({ 'icon:bm-1': { type: 'custom', value: 'url' } });
      }
    });

    loadCustomIcons(customIcons => {
      expect(customIcons).toEqual({
        'bm-1': { type: 'custom', value: 'url' }
      });
      done();
    });
  });

  test('loadCustomIcons runs migration and merges defaults when customIconsKeys is missing', done => {
    chrome.storage.sync.get.mockImplementation((keys, cb) => {
      if (keys === null) {
        cb({
          'icon:existing': { type: 'custom', value: 'existing-url' },
          customIconsInitialized: false
        });
      } else if (Array.isArray(keys) && keys.includes('customIconsKeys')) {
        cb({});
      }
    });
    chrome.storage.sync.set.mockImplementation((data, cb) => {
      expect(data.customIconsInitialized).toBe(true);
      expect(data.customIconsKeys).toContain('icon:existing');
      cb();
    });

    loadCustomIcons(customIcons => {
      expect(customIcons['existing']).toEqual({ type: 'custom', value: 'existing-url' });
      done();
    });
  });
});
