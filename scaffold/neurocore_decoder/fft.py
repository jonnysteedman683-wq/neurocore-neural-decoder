import math

def fft(samples: list[float]) -> list[complex]:
    n = len(samples)
    # n must be a power of 2
    if n == 0 or (n & (n - 1)) != 0:
        raise ValueError("Number of samples must be a power of 2")
    
    # Bit-reversed addressing
    real = list(samples)
    imag = [0.0] * n
    
    j = 0
    for i in range(n - 1):
        if i < j:
            real[i], real[j] = real[j], real[i]
            imag[i], imag[j] = imag[j], imag[i]
        k = n >> 1
        while k <= j:
            j -= k
            k >>= 1
        j += k

    # Radix-2 FFT
    size = 2
    while size <= n:
        half_size = size >> 1
        angle_step = -math.pi / half_size
        
        for i in range(0, n, size):
            w_real = 1.0
            w_imag = 0.0
            w_real_step = math.cos(angle_step)
            w_imag_step = math.sin(angle_step)
            
            for j_ in range(half_size):
                match = i + j_ + half_size
                
                t_real = w_real * real[match] - w_imag * imag[match]
                t_imag = w_real * imag[match] + w_imag * real[match]
                
                real[match] = real[i + j_] - t_real
                imag[match] = imag[i + j_] - t_imag
                
                real[i + j_] += t_real
                imag[i + j_] += t_imag
                
                next_w_real = w_real * w_real_step - w_imag * w_imag_step
                next_w_imag = w_real * w_imag_step + w_imag * w_real_step
                w_real, w_imag = next_w_real, next_w_imag
        
        size <<= 1
        
    return [complex(r, i) for r, i in zip(real, imag)]
