<template>
  <div class="range-slider">
    <label v-if="label" class="range-label">
      {{ label }}
      <input
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :value="modelValue"
          @input="handleNumberInput"
          @blur="validateInput"
          class="range-value"
      />
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

const handleNumberInput = (event) => {
  const value = parseFloat(event.target.value);
  if (!isNaN(value)) {
    emit('update:modelValue', value);
  }
};

const validateInput = (event) => {
  let value = parseFloat(event.target.value);
  if (isNaN(value)) {
    value = props.min;
  } else {
    value = Math.max(props.min, Math.min(props.max, value));
  }
  emit('update:modelValue', value);
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
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.range-value {
  font-family: 'Courier New', monospace;
  background: rgba(139, 92, 246, 0.15);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
  width: 80px;
  text-align: center;
  transition: all 0.2s ease;
}

.range-value:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
}

.range-value:focus {
  outline: none;
  background: rgba(139, 92, 246, 0.25);
  border-color: rgba(167, 139, 250, 0.8);
}

/* Masquer les flèches du input number */
.range-value::-webkit-outer-spin-button,
.range-value::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.range-value[type=number] {
  -moz-appearance: textfield;
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
  background: rgba(139, 92, 246, 0.15);
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.slider-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
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
  background: #a78bfa;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  background: #b794f6;
  box-shadow: 0 3px 12px rgba(139, 92, 246, 0.5);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.05);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #a78bfa;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  background: #b794f6;
  box-shadow: 0 3px 12px rgba(139, 92, 246, 0.5);
}

.slider::-moz-range-thumb:active {
  transform: scale(1.05);
}

.slider::-moz-range-track {
  background: transparent;
  border: none;
}
</style>