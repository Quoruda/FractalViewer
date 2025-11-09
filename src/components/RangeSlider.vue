<template>
  <div class="range-slider">
    <label v-if="label" class="range-label">
      {{ label }}
      <span class="range-value">{{ displayValue }}</span>
    </label>
    <div class="slider-container">
      <div class="slider-track">
        <div class="slider-fill" :style="{ width: fillPercent + '%' }"></div>
      </div>
      <input
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="modelValue"
          @input="handleInput"
          class="slider"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  label: {
    type: String,
    default: ''
  },
  decimals: {
    type: Number,
    default: 2
  }
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event) => {
  emit('update:modelValue', parseFloat(event.target.value));
};

const displayValue = computed(() => {
  return props.modelValue.toFixed(props.decimals);
});

const fillPercent = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});
</script>

<style scoped>
.range-slider {
  width: 100%;
  max-width: 400px;
  margin: 10px 10px;
}

.range-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #e0e0e0;
  font-weight: 500;
}

.range-value {
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #4fc3f7;
}

.slider-container {
  position: relative;
  height: 6px;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #29b6f6, #4fc3f7);
  border-radius: 3px;
  transition: width 0.05s ease;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: transparent;
  outline: none;
  cursor: pointer;
  margin: 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.4);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.6);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4fc3f7;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.4);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.6);
}

.slider::-moz-range-thumb:active {
  transform: scale(1.1);
}

.slider::-moz-range-track {
  background: transparent;
  border: none;
}
</style>