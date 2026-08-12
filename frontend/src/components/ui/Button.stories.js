import Button from './Button.vue';

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'destructive', 'secondary', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Default = {
  args: {
    variant: 'default',
    size: 'default',
    default: 'Click Me',
  },
};

export const Destructive = {
  args: {
    variant: 'destructive',
    size: 'default',
    default: 'Hapus Data',
  },
};

export const Outline = {
  args: {
    variant: 'outline',
    size: 'default',
    default: 'Batal',
  },
};

export const Loading = {
  args: {
    variant: 'default',
    size: 'default',
    loading: true,
    default: 'Memproses...',
  },
};
