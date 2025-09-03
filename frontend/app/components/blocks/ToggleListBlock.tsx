import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { ToggleListContent } from '@/lib/types/content-blocks';

interface ToggleListBlockProps {
  content: ToggleListContent;
}

export function ToggleListBlock({ content }: ToggleListBlockProps) {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="border rounded-lg">
          <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50">
            <span className="font-medium">{content.summary}</span>
            <ChevronDown 
              className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pb-4 text-gray-700">
            {content.details}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}